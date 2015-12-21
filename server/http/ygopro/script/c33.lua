--No.33 先史遺産－超兵器マシュ＝マック MACHU MECH
function c33.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,5,2)
	c:EnableReviveLimit()
	--attack up
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_DAMAGE+CATEGORY_ATKCHANGE)
	e1:SetDescription(aux.Stringid(33,0))
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetHintTiming(0,0x1e0)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCountLimit(1)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCost(c33.cost)
	e1:SetTarget(c33.target)
	e1:SetOperation(c33.operation)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e2:SetValue(c33.indes)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	e3:SetValue(c33.indval)
	c:RegisterEffect(e3)
end
function c33.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c33.filter(c)
	return c:IsFaceup() and c:GetAttack()~=c:GetBaseAttack()
end
function c33.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(1-tp) and c33.filter(chkc) end
	if chk==0 then return Duel.IsExistingTarget(c33.filter,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_FACEUP)
	local g=Duel.SelectTarget(tp,c33.filter,tp,0,LOCATION_MZONE,1,1,nil)
	local tc=g:GetFirst()
	local atk=tc:GetAttack()
	local batk=tc:GetBaseAttack()
	Duel.SetOperationInfo(0,CATEGORY_DAMAGE,nil,0,1-tp,(batk>atk) and (batk-atk) or (atk-batk))
end
function c33.operation(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsFaceup() then
		local atk=tc:GetAttack()
		local batk=tc:GetBaseAttack()
		if batk~=atk then
			local dif=(batk>atk) and (batk-atk) or (atk-batk)
			local dam=Duel.Damage(1-tp,dif,REASON_EFFECT)
			if dam>0 and c:IsRelateToEffect(e) and c:IsFaceup() then
				local e1=Effect.CreateEffect(c)
				e1:SetType(EFFECT_TYPE_SINGLE)
				e1:SetCode(EFFECT_UPDATE_ATTACK)
				e1:SetValue(dif)
				e1:SetReset(RESET_EVENT+0x1ff0000)
				c:RegisterEffect(e1)
			end
		end
	end
end

function c33.indes(e,c)
	return not c:IsSetCard(0x48)
end

function c33.indval(e,re)
	if not re then return false end
	local ty=re:GetActiveType()
	return not re:GetOwner():IsSetCard(0x48)
end
