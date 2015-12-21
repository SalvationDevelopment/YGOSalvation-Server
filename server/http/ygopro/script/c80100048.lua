--エルシャドール・ミドラーシュ
function c80100048.initial_effect(c)
	--fusion material
	c:EnableReviveLimit()
	aux.AddFusionProcFun2(c,aux.FilterBoolFunction(Card.IsSetCard,0x9b),aux.FilterBoolFunction(Card.IsAttribute,ATTRIBUTE_DARK),true)
	--indestructable
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	e1:SetValue(c80100048.indval)
	c:RegisterEffect(e1)
	--disable summon
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e2:SetTargetRange(1,1)
	e2:SetTarget(c80100048.tg)
	c:RegisterEffect(e2)
	--to grave
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_TOHAND)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e3:SetCode(EVENT_TO_GRAVE)
	e3:SetTarget(c80100048.target)
	e3:SetOperation(c80100048.operation)
	c:RegisterEffect(e3)
	--spsummon condition
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e4:SetCode(EFFECT_SPSUMMON_CONDITION)
	e4:SetValue(c80100048.splimit)
	c:RegisterEffect(e4)
	if not c80100048.global_check then
		c80100048.global_check=true
		c80100048[0]=0
		c80100048[1]=0
		local ge3=Effect.CreateEffect(c)
		ge3:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge3:SetCode(EVENT_SPSUMMON_SUCCESS)
		ge3:SetOperation(c80100048.checkop)
		Duel.RegisterEffect(ge3,0)
		local ge4=Effect.CreateEffect(c)
		ge4:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
		ge4:SetCode(EVENT_PHASE_START+PHASE_DRAW)
		ge4:SetOperation(c80100048.clear)
		Duel.RegisterEffect(ge4,0)
	end
end
function c80100048.tg(e,sc,sp,st)
	return c80100048[sp]>=1
end
function c80100048.checkop(e,tp,eg,ep,ev,re,r,rp)
	local s1=false
	local s2=false
	local tc=eg:GetFirst()
	while tc do
		if tc:GetSummonPlayer()==0 then s1=true
		else s2=true end
		tc=eg:GetNext()
	end
	if s1 then c80100048[0]=c80100048[0]+1 end
	if s2 then c80100048[1]=c80100048[1]+1 end
end
function c80100048.clear(e,tp,eg,ep,ev,re,r,rp)
	c80100048[0]=0
	c80100048[1]=0
end
function c80100048.splimit(e,se,sp,st)
	if e:GetHandler():IsLocation(LOCATION_EXTRA) then 
		return bit.band(st,SUMMON_TYPE_FUSION)==SUMMON_TYPE_FUSION
	end
	return true
end
function c80100048.filter(c)
	return c:IsSetCard(0x9b) and c:IsAbleToHand() and c:IsType(TYPE_SPELL+TYPE_TRAP)
end
function c80100048.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c80100048.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80100048.filter,tp,LOCATION_GRAVE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectTarget(tp,c80100048.filter,tp,LOCATION_GRAVE,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,1,0,0)
end
function c80100048.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,tc)
	end
end
function c80100048.indval(e,re,tp)
	return e:GetHandlerPlayer()~=re:GetHandlerPlayer()
end