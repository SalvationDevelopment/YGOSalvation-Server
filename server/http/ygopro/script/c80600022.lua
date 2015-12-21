--武神－ミカズチ
function c80600022.initial_effect(c)
	c:SetUniqueOnField(1,0,80600022)
	--spsummon
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e1:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e1:SetCode(EVENT_TO_GRAVE)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c80600022.spcon)
	e1:SetOperation(c80600022.spop)
	c:RegisterEffect(e1)
	--add
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetDescription(aux.Stringid(80600022,0))
	e2:SetCode(EVENT_PHASE+PHASE_END)
	e2:SetRange(LOCATION_MZONE)
	e2:SetProperty(EFFECT_FLAG_REPEAT)
	e2:SetCountLimit(1)
	e2:SetCondition(c80600022.con)
	e2:SetTarget(c80600022.tg)
	e2:SetOperation(c80600022.op)
	c:RegisterEffect(e2)
	if c80600022.discard==nil then
		c80600022.discard=true
		c80600022[0]=false
		c80600022[1]=false
		local e3=Effect.CreateEffect(c)
		e3:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
		e3:SetCode(EVENT_PHASE_START+PHASE_DRAW)
		e3:SetOperation(c80600022.reset)
		Duel.RegisterEffect(e3,0)
		local e4=Effect.CreateEffect(c)
		e4:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
		e4:SetCode(EVENT_TO_GRAVE)
		e4:SetOperation(c80600022.set)
		Duel.RegisterEffect(e4,0)
	end
end
function c80600022.spcon(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	while tc do
		if tc:IsReason(REASON_DESTROY) and tc:IsSetCard(0x88) and tc:IsRace(RACE_BEASTWARRIOR) 
		and tc:IsControler(e:GetHandler():GetControler())
		then
			return e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false)
		end
		tc=eg:GetNext()
	end
	return false
end
function c80600022.spop(e,tp,eg,ep,ev,re,r,rp)
	if e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) then
		Duel.SpecialSummon(e:GetHandler(),0,tp,tp,false,false,POS_FACEUP)
	end
end
function c80600022.set(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	while tc do
		local p=tc:GetControler()
		if c80600022.cfilter(tc) then
		c80600022[p]=true
		end
		tc=eg:GetNext()
	end
end
function c80600022.cfilter(c)
	return  c:IsSetCard(0x88) and c:IsType(TYPE_MONSTER) and c:GetPreviousLocation()==LOCATION_HAND 
end
function c80600022.reset(e,tp,eg,ep,ev,re,r,rp)
	c80600022[0]=false
	c80600022[1]=false
end
function c80600022.con(e,tp,eg,ep,ev,re,r,rp)
	return c80600022[tp]
end
function c80600022.tg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c80600022.filter,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c80600022.filter(c)
	return c:IsSetCard(0x88) and c:IsType(TYPE_SPELL+TYPE_TRAP) and c:IsAbleToHand()
end
function c80600022.op(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.SelectTarget(tp,c80600022.filter,tp,LOCATION_DECK,0,1,1,nil)
	if tc then
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,tc)
	end
end
