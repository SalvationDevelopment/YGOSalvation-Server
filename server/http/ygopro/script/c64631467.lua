--サクリファイス
function c64631467.initial_effect(c)
	c:EnableReviveLimit()
	--equip
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(64631467,0))
	e1:SetCategory(CATEGORY_EQUIP)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCondition(c64631467.eqcon)
	e1:SetTarget(c64631467.eqtg)
	e1:SetOperation(c64631467.eqop)
	c:RegisterEffect(e1)
	--damage
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_CONTINUOUS)
	e2:SetProperty(EFFECT_FLAG_AVAILABLE_BD)
	e2:SetCode(EVENT_DAMAGE)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCondition(c64631467.damcon)
	e2:SetOperation(c64631467.damop)
	e2:SetLabelObject(e1)
	c:RegisterEffect(e2)
end
function c64631467.eqcon(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local ec=e:GetLabelObject()
	return ec==nil or ec:GetFlagEffect(64631467)==0
end
function c64631467.eqtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsControler(1-tp) and chkc:IsAbleToChangeControler() end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_SZONE)>0
		and Duel.IsExistingTarget(Card.IsAbleToChangeControler,tp,0,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_EQUIP)
	local g=Duel.SelectTarget(tp,Card.IsAbleToChangeControler,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_EQUIP,g,1,0,0)
end
function c64631467.eqlimit(e,c)
	return e:GetOwner()==c
end
function c64631467.eqop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		if c:IsFaceup() and c:IsRelateToEffect(e) then
			local atk=tc:GetTextAttack()
			local def=tc:GetTextDefence()
			if tc:IsFacedown() or atk<0 then atk=0 end
			if tc:IsFacedown() or def<0 then def=0 end
			if not Duel.Equip(tp,tc,c,false) then return end
			--Add Equip limit
			tc:RegisterFlagEffect(64631467,RESET_EVENT+0x1fe0000,0,0)
			e:SetLabelObject(tc)
			local e1=Effect.CreateEffect(c)
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetProperty(EFFECT_FLAG_COPY_INHERIT+EFFECT_FLAG_OWNER_RELATE)
			e1:SetCode(EFFECT_EQUIP_LIMIT)
			e1:SetReset(RESET_EVENT+0x1fe0000)
			e1:SetValue(c64631467.eqlimit)
			tc:RegisterEffect(e1)
			if atk>0 then
				local e2=Effect.CreateEffect(c)
				e2:SetType(EFFECT_TYPE_EQUIP)
				e2:SetProperty(EFFECT_FLAG_IGNORE_IMMUNE+EFFECT_FLAG_OWNER_RELATE)
				e2:SetCode(EFFECT_SET_ATTACK)
				e2:SetReset(RESET_EVENT+0x1fe0000)
				e2:SetValue(atk)
				tc:RegisterEffect(e2)
			end
			if def>0 then
				local e3=Effect.CreateEffect(c)
				e3:SetType(EFFECT_TYPE_EQUIP)
				e3:SetProperty(EFFECT_FLAG_IGNORE_IMMUNE+EFFECT_FLAG_OWNER_RELATE)
				e3:SetCode(EFFECT_SET_DEFENCE)
				e3:SetReset(RESET_EVENT+0x1fe0000)
				e3:SetValue(def)
				tc:RegisterEffect(e3)
			end
			local e4=Effect.CreateEffect(c)
			e4:SetType(EFFECT_TYPE_EQUIP)
			e4:SetCode(EFFECT_DESTROY_SUBSTITUTE)
			e4:SetProperty(EFFECT_FLAG_SET_AVAILABLE)
			e4:SetReset(RESET_EVENT+0x1fe0000)
			e4:SetValue(c64631467.repval)
			tc:RegisterEffect(e4)
		else  end
	end
end
function c64631467.repval(e,re,r,rp)
	return bit.band(r,REASON_BATTLE)~=0
end
function c64631467.damcon(e,tp,eg,ep,ev,re,r,rp)
	local ec=e:GetLabelObject():GetLabelObject()
	return ec and ec:GetFlagEffect(64631467)~=0 and ep==tp and bit.band(r,REASON_BATTLE)~=0
		and (Duel.GetAttacker()==e:GetHandler() or Duel.GetAttackTarget()==e:GetHandler())
end
function c64631467.damop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Damage(1-tp,ev,REASON_EFFECT)
end
