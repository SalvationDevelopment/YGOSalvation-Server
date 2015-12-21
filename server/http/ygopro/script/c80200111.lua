--Ｎｏ．２３冥界の霊騎士ランスロット
function c80200111.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunction(c,8),2)
	c:EnableReviveLimit()
	--direct attack
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_DIRECT_ATTACK)
	e1:SetCondition(c80200111.effcon)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(80200111,0))
	e2:SetCategory(CATEGORY_DESTROY)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e2:SetCode(EVENT_BATTLE_DAMAGE)
	e2:SetCondition(c80200111.condition)
	e2:SetTarget(c80200111.target)
	e2:SetOperation(c80200111.operation)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80200111,0))
	e3:SetType(EFFECT_TYPE_QUICK_F)
	e3:SetCode(EVENT_CHAINING)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCountLimit(1,EFFECT_COUNT_CODE_SINGLE)
	e3:SetCondition(c80200111.negcon)
	e3:SetCost(c80200111.cost)
	e3:SetTarget(c80200111.negtg)
	e3:SetOperation(c80200111.negop)
	c:RegisterEffect(e3)
end
function c80200111.effcon(e)
	return e:GetHandler():GetOverlayCount()>0
end
function c80200111.condition(e,tp,eg,ep,ev,re,r,rp)
	return ep~=tp
end
function c80200111.filter(c)
	return c:IsDestructable() and c:IsFaceup()
end
function c80200111.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(1-tp) and chkc:IsLocation(LOCATION_MZONE) and c80200111.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c80200111.filter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,c80200111.filter,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,1,0,0)
end
function c80200111.operation(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.Destroy(tc,REASON_EFFECT)
	end
end
function c80200111.negcon(e,tp,eg,ep,ev,re,r,rp)
	local rc=re:GetHandler()
	return 	rc~=e:GetHandler() and (
			re:IsActiveType(TYPE_MONSTER)
			or ((rc:GetType()==TYPE_SPELL or rc:GetType()==TYPE_TRAP) and re:IsHasType(EFFECT_TYPE_ACTIVATE))
			)
end
function c80200111.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	Duel.Hint(HINT_OPSELECTED,1-tp,e:GetDescription())
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c80200111.negtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	Duel.SetOperationInfo(0,CATEGORY_NEGATE,eg,1,0,0)
end
function c80200111.negop(e,tp,eg,ep,ev,re,r,rp)
	Duel.NegateActivation(ev)
end