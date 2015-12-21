--Silent Swordsman LV:0
function c12315.initial_effect(c)
	--atkup
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_F)
	e1:SetDescription(aux.Stringid(12315,0))
	e1:SetCategory(CATEGORY_ATKCHANGE)
	e1:SetCode(EVENT_PHASE+PHASE_STANDBY)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCondition(c12315.condition)
	e1:SetCost(c12315.cost)
	e1:SetOperation(c12315.operation)
	c:RegisterEffect(e1)
end

function c12315.condition(e,tp,eg,ep,ev,re,r,rp)
	return tp==Duel.GetTurnPlayer()
end
function c12315.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():GetFlagEffect(12315)==0 end
	e:GetHandler():RegisterFlagEffect(12315,RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END,EFFECT_FLAG_OATH,1)
end
function c12315.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsFaceup() and c:IsRelateToEffect(e) then
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetReset(RESET_EVENT+0x1ff0000)
		e1:SetValue(500)
		c:RegisterEffect(e1)
		local e2=Effect.CreateEffect(c)
		e2:SetType(EFFECT_TYPE_SINGLE)
		e2:SetCode(EFFECT_UPDATE_LEVEL)
		e2:SetReset(RESET_EVENT+0x1ff0000)
		e2:SetValue(1)
		c:RegisterEffect(e2)
	end
end
