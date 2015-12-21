--Raidraptor - Fuzzy Lanius
function c13790562.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetCode(EVENT_TO_GRAVE)
	e1:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e1:SetCountLimit(1,23790562)
	e1:SetCost(c13790562.cost)
	e1:SetTarget(c13790562.thtg2)
	e1:SetOperation(c13790562.tgop2)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetRange(LOCATION_HAND)
	e2:SetCountLimit(1,13790562)
	e2:SetCost(c13790562.cost)
	e2:SetCondition(c13790562.sscon)
	e2:SetTarget(c13790562.sstg)
	e2:SetOperation(c13790562.ssop)
	c:RegisterEffect(e2)
	if not c13790562.global_check then
		c13790562.global_check=true
		local ge1=Effect.CreateEffect(c)
		ge1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge1:SetCode(EVENT_SPSUMMON_SUCCESS)
		ge1:SetOperation(c13790562.checkop)
		Duel.RegisterEffect(ge1,0)
		local ge2=Effect.CreateEffect(c)
		ge2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge2:SetCode(EVENT_PHASE_START+PHASE_DRAW)
		ge2:SetOperation(c13790562.clear)
		Duel.RegisterEffect(ge2,0)
	end
end
function c13790562.checkop(e,tp,eg,ep,ev,re,r,rp)
	local tc=eg:GetFirst()
	while tc do
		if not tc:IsSetCard(0xba) then
			c13790562[tc:GetSummonPlayer()]=false
		end
		tc=eg:GetNext()
	end
end
function c13790562.clear(e,tp,eg,ep,ev,re,r,rp)
	c13790562[0]=true
	c13790562[1]=true
end
function c13790562.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return c13790562[tp] end
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
	e1:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e1:SetReset(RESET_PHASE+PHASE_END)
	e1:SetTargetRange(1,0)
	e1:SetTarget(c13790562.splimit)
	Duel.RegisterEffect(e1,tp)
end
function c13790562.splimit(e,c)
	return not c:IsSetCard(0xba)
end

function c13790562.filter1(c)
	return c:IsFaceup() and c:IsSetCard(0xba) and c:GetCode()~=13790562
end
function c13790562.sscon(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c13790562.filter1,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,nil)
end
function c13790562.sstg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,false,false) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
end
function c13790562.ssop(e,tp,eg,ep,ev,re,r,rp)
	if not Duel.IsExistingMatchingCard(c13790562.filter1,tp,LOCATION_ONFIELD,0,1,nil) then return end
	if e:GetHandler():IsRelateToEffect(e) then
		Duel.SpecialSummon(e:GetHandler(),0,tp,tp,false,false,POS_FACEUP)
	end
end

function c13790562.thfilter2(c)
	return c:GetCode()==13790562 and c:IsAbleToHand()
end
function c13790562.thtg2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790562.thfilter2,tp,LOCATION_DECK,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_DECK)
end
function c13790562.tgop2(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c13790562.thfilter2,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end
