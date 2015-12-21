--ÇcÇcÉPÉãÉxÉçÉX
function c80200123.initial_effect(c)
	--pendulum summon
	aux.AddPendulumProcedure(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)	
	--atkup
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_ATKCHANGE)
	e2:SetDescription(aux.Stringid(80200123,0))
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCountLimit(1)
	e2:SetRange(LOCATION_PZONE)
	e2:SetTarget(c80200123.atktg)
	e2:SetOperation(c80200123.atkop)
	c:RegisterEffect(e2)
	--tohand
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80200123,0))
	e3:SetCategory(CATEGORY_TOHAND)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetCode(EVENT_SPSUMMON_SUCCESS)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetCondition(c80200123.condition)
	e3:SetTarget(c80200123.target)
	e3:SetOperation(c80200123.operation)
	c:RegisterEffect(e3)
end
function c80200123.filter(c)
	return c:IsFaceup() and c:IsSetCard(0xaf) and c:GetLevel()~=4 and not c:IsType(TYPE_XYZ)
end
function c80200123.atktg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsLocation(LOCATION_MZONE) and c80200123.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80200123.filter,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,c80200123.filter,tp,LOCATION_MZONE,0,1,1,nil)
end
function c80200123.atkop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsFaceup() and tc:GetLevel()~=4 then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_CHANGE_LEVEL)
		e1:SetValue(4)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e1)		
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_UPDATE_ATTACK)
		e2:SetValue(400)
		e2:SetReset(RESET_EVENT+0x1fe0000)
		tc:RegisterEffect(e2)
		local e3=e2:Clone()
		e2:SetCode(EFFECT_UPDATE_DEFENCE)
		tc:RegisterEffect(e3)
	end
end
function c80200123.cfilter(c)
	return c:IsFaceup() and c:IsSetCard(0xaf)
end
function c80200123.condition(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	return 	c:GetSummonType()==SUMMON_TYPE_PENDULUM and c:IsPreviousLocation(LOCATION_HAND)
			and Duel.IsExistingMatchingCard(c80200123.cfilter,tp,LOCATION_MZONE,0,1,c)
end
function c80200123.filter1(c)
	return c:GetType()==TYPE_SPELL+TYPE_CONTINUOUS and c:IsAbleToHand()
end
function c80200123.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c80200123.filter1(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80200123.filter1,tp,LOCATION_GRAVE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectTarget(tp,c80200123.filter1,tp,LOCATION_GRAVE,0,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,g,g:GetCount(),0,0)
end
function c80200123.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		Duel.SendtoHand(tc,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,tc)
	end
end