--Sephira Fuushi, Treasure of the Yang Zing
--CHIBI FIX ARCHETYPE CRAP NYANYANYANYANYANYANYANYANYANYANYANYANYA
--CHIBI FIX ARCHETYPE CRAP NYANYANYANYANYANYANYANYANYANYANYANYANYA
function c80100124.initial_effect(c)
--pendulum summon
	aux.AddPendulumProcedure(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--splimit
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_CANNOT_DISABLE)
	e2:SetRange(LOCATION_PZONE)
	e2:SetTargetRange(1,0)
	e2:SetTarget(c80100124.splimit)
	c:RegisterEffect(e2)
	--Tuner
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e3:SetCode(EVENT_SPSUMMON_SUCCESS)
	e3:SetCountLimit(1,80100124)
	e3:SetCondition(c80100124.condition)
	e3:SetCost(c80100124.cost)
	e3:SetTarget(c80100124.target)
	e3:SetOperation(c80100124.activate)
	c:RegisterEffect(e3)
end
function c80100124.splimit(e,c,tp,sumtp,sumpos)
	return not (c:IsSetCard(0x9e) or c:IsSetCard(0xc3)) and bit.band(sumtp,SUMMON_TYPE_PENDULUM)==SUMMON_TYPE_PENDULUM
end
function c80100124.filter(c)
	return c:IsFaceup() and (c:IsSetCard(0x9e) or c:IsSetCard(0xc3)) and not c:IsType(TYPE_TUNER) and not c:IsCode(80100124)
end
function c80100124.condition(e,tp,eg,ep,ev,re,r,rp)
	return  e:GetHandler():IsPreviousLocation(LOCATION_DECK) or e:GetHandler():GetSummonType()==SUMMON_TYPE_PENDULUM
end
function c80100124.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local c=e:GetHandler()
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_LEAVE_FIELD_REDIRECT)
	e1:SetValue(LOCATION_DECKBOT)
	e1:SetReset(RESET_EVENT+0x47e0000)
	c:RegisterEffect(e1)
end
function c80100124.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(tp) and c80100124.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80100124.filter,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	Duel.SelectTarget(tp,c80100124.filter,tp,LOCATION_MZONE,0,1,1,nil)
end
function c80100124.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsFaceup() then
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_ADD_TYPE)
		e1:SetReset(RESET_EVENT+0x1fe0000)
		e1:SetValue(TYPE_TUNER)
		tc:RegisterEffect(e1)
	end
end
function c80100124.recon(e)
	local c=e:GetHandler()
	return c:IsFaceup()
end
