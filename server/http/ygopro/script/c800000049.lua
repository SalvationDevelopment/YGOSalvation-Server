--虚構王 アンフォームド・ボイド
function c800000049.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunction(c,4),3)
	c:EnableReviveLimit()
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(800000049,0))
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET+EFFECT_FLAG_DAMAGE_STEP)
	e1:SetCategory(CATEGORY_ATKCHANGE)
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(TIMING_DAMAGE_STEP,TIMING_DAMAGE_STEP+0x1c0)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCost(c800000049.cost)
	e1:SetCondition(c800000049.con)
	e1:SetOperation(c800000049.op)
	c:RegisterEffect(e1)	
end
function c800000049.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c800000049.con(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c800000049.filter,tp,0,LOCATION_MZONE,1,nil)
	and Duel.GetTurnPlayer()~=tp
end
function c800000049.filter(c)
	return c:IsFaceup() and c:IsType(TYPE_XYZ)
end
function c800000049.op(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local g=Duel.GetMatchingGroup(c800000049.filter,tp,0,LOCATION_MZONE,nil)
	if g:GetCount()>0 then
		local atk=0
		local tc=g:GetFirst()
		while tc do
			atk=atk+tc:GetAttack()
			tc=g:GetNext()
		end
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetValue(atk)
		e1:SetReset(RESET_EVENT+0x1ff0000)
		c:RegisterEffect(e1)
	end
end